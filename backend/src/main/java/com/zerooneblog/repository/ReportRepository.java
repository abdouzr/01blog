// backend/src/main/java/com/zerooneblog/repository/ReportRepository.java
package com.zerooneblog.repository;

import com.zerooneblog.model.Report;
import com.zerooneblog.model.ReportStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByStatusOrderByCreatedAtDesc(ReportStatus status);
}