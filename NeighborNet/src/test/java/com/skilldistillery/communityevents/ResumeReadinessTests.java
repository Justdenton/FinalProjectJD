package com.skilldistillery.communityevents;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.skilldistillery.communityevents.entities.*;
import com.skilldistillery.communityevents.repositories.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ResumeReadinessTests {
    @Autowired MockMvc mvc;
    @Autowired UserRepository users;
    @Autowired ReportRepository reports;
    @Autowired CommentRepository comments;
    @Autowired PasswordEncoder encoder;

    private User user(String name) {
        User user = new User();
        user.setUsername(name);
        user.setPassword(encoder.encode("test-only-password"));
        user.setEnabled(true);
        user.setRole("standard");
        return users.saveAndFlush(user);
    }

    private Report report(User owner) {
        Report report = new Report();
        report.setName("Test community event");
        report.setUser(owner);
        report.setEnabled(true);
        return reports.saveAndFlush(report);
    }

    @Test void registrationAndLoginWorkWithoutReturningPasswordHashes() throws Exception {
        mvc.perform(post("/register").contentType(MediaType.APPLICATION_JSON).content("""
            {"username":"new-demo-user","password":"test-only-password","firstName":"Demo",
             "address":{"name":"Demo","street":"1 Test St","city":"Peoria","state":"IL",
                        "postalCode":"61602","country":"US","enabled":true}}
            """))
            .andExpect(status().isOk()).andExpect(jsonPath("$.username").value("new-demo-user"))
            .andExpect(jsonPath("$.password").doesNotExist());
        assertTrue(encoder.matches("test-only-password", users.findByUsername("new-demo-user").getPassword()));
        mvc.perform(get("/authenticate").with(httpBasic("new-demo-user", "test-only-password")))
            .andExpect(status().isOk()).andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test void publicReportsDoNotExposeOwnerPasswordHashes() throws Exception {
        report(user("owner"));
        mvc.perform(get("/api/reports")).andExpect(status().isOk())
            .andExpect(jsonPath("$[0].user.username").value("owner"))
            .andExpect(jsonPath("$[0].user.password").doesNotExist());
    }

    @Test void unauthenticatedWritesAndInvalidCredentialsAreRejected() throws Exception {
        user("owner");
        mvc.perform(post("/api/reports").contentType(MediaType.APPLICATION_JSON).content("{}"))
            .andExpect(status().isUnauthorized());
        mvc.perform(get("/authenticate").with(httpBasic("owner", "wrong-password")))
            .andExpect(status().isUnauthorized());
    }

    @Test void anotherUserCannotDisableAReport() throws Exception {
        Report report = report(user("owner"));
        user("other");
        mvc.perform(put("/api/reports/user/" + report.getId() + "/disable")
                .with(httpBasic("other", "test-only-password"))
                .contentType(MediaType.APPLICATION_JSON).content("{}"))
            .andExpect(status().isNotFound());
        assertTrue(reports.findById(report.getId()).orElseThrow().getEnabled());
    }

    @Test void ownerCanDisableAReport() throws Exception {
        Report report = report(user("owner"));
        mvc.perform(put("/api/reports/user/" + report.getId() + "/disable")
                .with(httpBasic("owner", "test-only-password"))
                .contentType(MediaType.APPLICATION_JSON).content("{}"))
            .andExpect(status().isOk());
        assertFalse(reports.findById(report.getId()).orElseThrow().getEnabled());
    }

    @Test void anotherUserCannotDisableAComment() throws Exception {
        User owner = user("owner");
        user("other");
        Comment comment = new Comment();
        comment.setUser(owner);
        comment.setBody("Test comment");
        comment.setEnabled(true);
        comment = comments.saveAndFlush(comment);
        mvc.perform(put("/api/comments/user/" + comment.getId() + "/disable")
                .with(httpBasic("other", "test-only-password"))
                .contentType(MediaType.APPLICATION_JSON).content("{}"))
            .andExpect(status().isNotFound());
        assertTrue(comments.findById(comment.getId()).orElseThrow().isEnabled());
    }

    @Test void ownerCanDisableAComment() throws Exception {
        Comment comment = new Comment();
        comment.setUser(user("owner"));
        comment.setBody("Test comment");
        comment.setEnabled(true);
        comment = comments.saveAndFlush(comment);
        mvc.perform(put("/api/comments/user/" + comment.getId() + "/disable")
                .with(httpBasic("owner", "test-only-password"))
                .contentType(MediaType.APPLICATION_JSON).content("{}"))
            .andExpect(status().isOk());
        assertFalse(comments.findById(comment.getId()).orElseThrow().isEnabled());
    }
}
