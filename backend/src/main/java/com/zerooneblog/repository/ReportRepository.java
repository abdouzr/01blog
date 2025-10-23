// backend/src/main/java/com/zerooneblog/repository/ReportRepository.java
package com.zerooneblog.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository; // Updated to use inner enum
import org.springframework.stereotype.Repository;

import com.zerooneblog.model.Report;
import com.zerooneblog.model.Report.ReportStatus;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByStatusOrderByCreatedAtDesc(ReportStatus status);
}