// backend/src/main/java/com/zerooneblog/repository/UserSubscriptionRepository.java

package com.zerooneblog.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.zerooneblog.model.User;
import com.zerooneblog.model.UserSubscription;

@Repository
public interface UserSubscriptionRepository extends JpaRepository<UserSubscription, Long> {
    
    /**
     * Find a specific subscription relationship between two users
     */
    Optional<UserSubscription> findBySubscriberAndSubscribedTo(User subscriber, User subscribedTo);
    
    /**
     * Find all users that a specific user is subscribed to
     */
    List<UserSubscription> findBySubscriber(User subscriber);
    
    /**
     * Find all users who are subscribed to a specific user
     */
    List<UserSubscription> findBySubscribedTo(User subscribedTo);
    
    /**
     * Check if a subscription exists between two users
     */
    boolean existsBySubscriberAndSubscribedTo(User subscriber, User subscribedTo);
    
    /**
     * ✅ NEW METHOD: Get all subscribers (User objects) of a specific user
     * This is used by NotificationService to get the list of users to notify
     */
    @Query("SELECT us.subscriber FROM UserSubscription us WHERE us.subscribedTo = :user")
    List<User> findSubscribersBySubscribedTo(@Param("user") User user);
}