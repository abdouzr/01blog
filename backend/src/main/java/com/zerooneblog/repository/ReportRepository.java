package com.zerooneblog.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.zerooneblog.model.Report;
import com.zerooneblog.model.Report.ReportStatus;
import com.zerooneblog.model.User;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByStatusOrderByCreatedAtDesc(ReportStatus status);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM Report r WHERE r.reporter = :reporter")
    void deleteByReporter(@Param("reporter") User reporter);

    public long countByStatus(ReportStatus reportStatus);
}