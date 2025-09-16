// backend/src/main/java/com/zerooneblog/repository/NotificationRepository.java
package com.zerooneblog.repository;

import com.zerooneblog.model.Notification;
import com.zerooneblog.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    List<Notification> findByUserAndIsReadFalseOrderByCreatedAtDesc(User user);
    Long countByUserAndIsReadFalse(User user);
}