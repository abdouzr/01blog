package com.zerooneblog.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zerooneblog.model.Report;
import com.zerooneblog.model.Report.ReportStatus;
import com.zerooneblog.model.Report.TargetType;
import com.zerooneblog.model.User;
import com.zerooneblog.repository.ReportRepository;

@Service
public class ReportService {

    @Autowired
    private ReportRepository reportRepository;

    @Transactional
    public Report createReport(User reporter, TargetType targetType, Long targetId, String reason) {
        System.out.println("Creating report - Reporter: " + reporter.getUsername() + 
                         ", TargetType: " + targetType + 
                         ", TargetId: " + targetId + 
                         ", Reason: " + reason);
        
        Report report = new Report();
        report.setReporter(reporter);
        report.setTargetType(targetType);
        report.setTargetId(targetId);
        report.setReason(reason);
        report.setStatus(ReportStatus.NEW);
        
        Report savedReport = reportRepository.save(report);
        System.out.println("Report saved with ID: " + savedReport.getId());
        
        return savedReport;
    }

    public List<Report> getAllNewReports() {
        return reportRepository.findByStatusOrderByCreatedAtDesc(ReportStatus.NEW);
    }

    @Transactional
    public Report markReportAsReviewed(Long reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        
        report.setStatus(ReportStatus.REVIEWED);
        return reportRepository.save(report);
    }
}