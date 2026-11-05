package com.skilldistillery.communityevents.services;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.skilldistillery.communityevents.entities.Address;
import com.skilldistillery.communityevents.entities.Report;
import com.skilldistillery.communityevents.entities.ReportCategory;
import com.skilldistillery.communityevents.entities.User;
import com.skilldistillery.communityevents.repositories.AddressRepository;
import com.skilldistillery.communityevents.repositories.ReportCategoryRepository;
import com.skilldistillery.communityevents.repositories.ReportRepository;
import com.skilldistillery.communityevents.repositories.UserRepository;

@Service
public class ReportServiceImpl implements ReportService {

	@Autowired
	private ReportRepository reportRepo;

	@Autowired
	private UserRepository userRepo;

	@Autowired
	private AddressRepository addrRepo;

	@Autowired
	private ReportCategoryRepository reportCategoryRepo;

	@Override
	public Set<Report> index(String username) {
//		return reportRepo.findByUser_Username(username);
//		System.out.println("In ReportServiceImp - index()");
		return reportRepo.findByUser_UsernameAndEnabledTrue(username);
	}

	@Override
	public Report show(String username, int id) {
		return null;
	}

	@Override
	public Report create(String username, Report report) {
		User user = userRepo.findByUsername(username);
		Address address = report.getAddress();
		List<Address> managedAddresses = addrRepo.findByStreetAndCityAndStateAndPostalCodeAndCountry(
				address.getStreet().trim(), address.getCity().trim(), address.getState().trim(),
				address.getPostalCode().trim(), address.getCountry().trim());

		// ReportCategory managedCategory = reportCategoryRepo.findById(int id);

		System.out.println();
		System.out.println(report.getImageUrl());
		System.out.println();

		if (report.getImageUrl() == "") {
			System.out.println("Empty Image URL!");
			report.setImageUrl("https://www.edwardhopper.net/assets/img/paintings/nighthawks.jpg");
		}
		if (user != null) {
			report.setUser(user);
			report.setEnabled(true);

			reportCategoryRepo.saveAndFlush(report.getReportCategory());

			if (managedAddresses != null && !managedAddresses.isEmpty()) {
				System.out.println("Address found (if) ");
				System.out.println(managedAddresses);
				report.setAddress(managedAddresses.get(0));
			} else {
				System.out.println("Address not found (else) ");
				report.getAddress().setEnabled(true);
				addrRepo.saveAndFlush(report.getAddress());
			}
			return reportRepo.saveAndFlush(report);
		} else {
			return null;
		}
	}

	@Override
	public Report update(String username, int id, Report updatedReport) {
		Optional<Report> reportOpt = reportRepo.findById(id);
		Report managedReport = null;
		if (reportOpt.isPresent()) {
			managedReport = reportOpt.get();
			if (!managedReport.getUser().getUsername().equals(username)) {
				return null;
			}
			managedReport.setName(updatedReport.getName());
			managedReport.setDescription(updatedReport.getDescription());
			managedReport.setImageUrl(updatedReport.getImageUrl());
			managedReport.setEnabled(updatedReport.getEnabled());
			managedReport.setReportCategory(updatedReport.getReportCategory());
			reportCategoryRepo.saveAndFlush(managedReport.getReportCategory());
			reportRepo.saveAndFlush(managedReport);
			;
		}
		return managedReport;
	}

	@Override
	public Report disable(String username, int id, Report updatedReport) {
		Optional<Report> reportOpt = reportRepo.findById(id);
		Report managedReport = null;
		if (reportOpt.isPresent()) {
			managedReport = reportOpt.get();
			if (!managedReport.getUser().getUsername().equals(username)) {
				return null;
			}
			managedReport.setEnabled(false);
			reportRepo.saveAndFlush(managedReport);
			return managedReport;
		}
		return null;
	}

	@Override
	public boolean destroy(String username, int id) {
		return false;
	}

	@Override
	public List<Report> showAllEnabledReports() {
		return reportRepo.findByEnabled(true);
	}

	@Override
	public boolean unenable(String name, int rid) {
		Report report = reportRepo.findByUser_UsernameAndId(name, rid);
		boolean deleted = false;

		if (report != null) {
			report.setEnabled(false);
			reportRepo.saveAndFlush(report);
			System.out.println(report);
			deleted = true;
		}
		return deleted;
	}

	@Override
	public Optional<Report> findById(int id) {
		return reportRepo.findById(id);
	}

}
