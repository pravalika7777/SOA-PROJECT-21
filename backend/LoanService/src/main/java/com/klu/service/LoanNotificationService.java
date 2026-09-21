package com.klu.service;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.klu.dto.OverdueLoanResponse;

@Service
public class LoanNotificationService {

    private static final Logger log = LoggerFactory.getLogger(LoanNotificationService.class);

    private final LoanService loanService;

    public LoanNotificationService(LoanService loanService) {
        this.loanService = loanService;
    }

    // Runs periodically in background (every hour by default, or configurable)
    @Scheduled(cron = "${loan.overdue-check-cron:0 0 * * * ?}")
    public void scheduledOverdueCheck() {
        log.info("Executing scheduled check for overdue book loans...");
        sendOverdueNotifications();
    }

    // Demonstrable on-demand method exposed via POST /loans/overdue/notify
    public List<String> sendOverdueNotifications() {
        List<OverdueLoanResponse> overdueLoans = loanService.getOverdueLoans();
        List<String> notifications = new ArrayList<>();

        if (overdueLoans.isEmpty()) {
            String message = "OVERDUE NOTIFICATION: No active loans are currently overdue.";
            log.info(message);
            notifications.add(message);
            return notifications;
        }

        for (OverdueLoanResponse overdue : overdueLoans) {
            String message = String.format(
                    "OVERDUE NOTIFICATION: User %d has overdue Book %d by %d days (Loan ID: %d, Due Date: %s)",
                    overdue.getUserId(),
                    overdue.getBookId(),
                    overdue.getDaysOverdue(),
                    overdue.getLoanId(),
                    overdue.getDueDate()
            );
            log.warn(message);
            notifications.add(message);
        }

        return notifications;
    }
}
