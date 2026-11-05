package com.skilldistillery.communityevents.services;



import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.skilldistillery.communityevents.entities.Comment;
import com.skilldistillery.communityevents.entities.Report;
import com.skilldistillery.communityevents.entities.User;
import com.skilldistillery.communityevents.repositories.AddressRepository;
import com.skilldistillery.communityevents.repositories.CommentRepository;
import com.skilldistillery.communityevents.repositories.ReportCategoryRepository;
import com.skilldistillery.communityevents.repositories.ReportRepository;
import com.skilldistillery.communityevents.repositories.UserRepository;

@Service
public class CommentServiceImpl implements CommentService {
	
	@Autowired
	private ReportRepository reportRepo;

	@Autowired
	private UserRepository userRepo;
	
	@Autowired
	private AddressRepository addrRepo;
	
	@Autowired
	private ReportCategoryRepository reportCategoryRepo;
	
	@Autowired
	private CommentRepository commentRepo;

	@Override
	public Set<Comment> index(String username) {
		return commentRepo.findByUser_UsernameAndEnabledTrue(username);
	}
	
	@Override
	public List<Comment> showAllEnabledComments() {
		return commentRepo.findByEnabled(true);
	}
	
	@Override
	public List<Comment> showCommentsByReportId(int reportId) {
	    return commentRepo.findByReport_Id(reportId);
	}

//	@Override
//	public Comment show(String username, int id) {
//		// TODO Auto-generated method stub
//		return null;
//	}
//
	
	@Override
	public Comment create(int reportId, String username, Comment comment) {
	    Optional<Report> reportOpt = reportRepo.findById(reportId);
	    if (!reportOpt.isPresent()) {
	        return null;
	    }
	    Report report = reportOpt.get();
	    User user = userRepo.findByUsername(username);
	    if (user == null) {
	        return null;
	    }
	    comment.setReport(report);
	    comment.setUser(user);
	    comment.setEnabled(true);
	   
	    return commentRepo.saveAndFlush(comment);
	}

	@Override
	public Comment update(int commentId, String username, Comment updatedComment) {
	    Optional<Comment> existingCommentOpt = commentRepo.findById(commentId);
	    if (!existingCommentOpt.isPresent()) {
	        return null;  
	    }
	    Comment existingComment = existingCommentOpt.get();
	    if (!existingComment.getUser().getUsername().equals(username)) {
	        return null; //checks if user is an authorized user
	    }
	    existingComment.setBody(updatedComment.getBody());
	    existingComment.setImageUrl(updatedComment.getImageUrl());
	    return commentRepo.saveAndFlush(existingComment);
	}

	@Override
	public Comment disable(String username, int commentId, Comment updatedComment) {
		Optional<Comment> commentOpt = commentRepo.findById(commentId);
		Comment existingComment = null;
		if (commentOpt.isPresent()) {
			existingComment = commentOpt.get();
			if (!existingComment.getUser().getUsername().equals(username)) {
				return null;
			}
			existingComment.setEnabled(false);
			commentRepo.saveAndFlush(existingComment);
			return existingComment;
		}
		return null;
	}
//
//	@Override
//	public boolean destroy(String username, int id) {
//		// TODO Auto-generated method stub
//		return false;
//	}
//
//
//	@Override
//	public boolean unenable(String name, int rid) {
//		// TODO Auto-generated method stub
//		return false;
//	}

	

}
