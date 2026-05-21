import { useEffect, useCallback } from 'react';
import { useAuthContext } from '@/src/context/AuthContext';
import { documentsService } from '@/src/services/firestore/documents.service';
import { toast } from '@/hooks/use-toast';
import { Document } from '@/src/types/document';

export function useDocumentReminders() {
  const auth = useAuthContext();

  const checkReminders = useCallback(async () => {
    if (!auth?.user?.uid) return;

    try {
      const response = await documentsService.getUserDocuments(auth.user.uid);
      if (!response.success || !response.data) return;

      const docs = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      const now = new Date();

      docs.forEach(doc => {
        if (!doc.renewalDate && !doc.dueDate) return;

        const dueDate = doc.dueDate || doc.renewalDate!;
        const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // Check 7 days reminder
        const sevenDayReminder = doc.reminders?.find(r => r.type === 'before_7_days');
        if (sevenDayReminder?.enabled && daysUntilDue === 7 && !sevenDayReminder.notified) {
          toast({
            title: `${doc.title} renewal in 7 days`,
            description: `${doc.provider || 'Document'} due on ${dueDate.toLocaleDateString()}`,
            variant: 'default',
          });
          updateReminderNotified(doc.id, 'before_7_days');
        }

        // Check 3 days reminder
        const threeDayReminder = doc.reminders?.find(r => r.type === 'before_3_days');
        if (threeDayReminder?.enabled && daysUntilDue === 3 && !threeDayReminder.notified) {
          toast({
            title: `${doc.title} renewal in 3 days`,
            description: `${doc.provider || 'Document'} due on ${dueDate.toLocaleDateString()}`,
            variant: 'default',
          });
          updateReminderNotified(doc.id, 'before_3_days');
        }

        // Check 1 day reminder
        const oneDayReminder = doc.reminders?.find(r => r.type === 'before_1_day');
        if (oneDayReminder?.enabled && daysUntilDue === 1 && !oneDayReminder.notified) {
          toast({
            title: `${doc.title} renewal tomorrow`,
            description: `${doc.provider || 'Document'} due on ${dueDate.toLocaleDateString()}`,
            variant: 'default',
          });
          updateReminderNotified(doc.id, 'before_1_day');
        }

        // Check on due date reminder
        const dueDateReminder = doc.reminders?.find(r => r.type === 'on_due_date');
        if (dueDateReminder?.enabled && daysUntilDue === 0 && !dueDateReminder.notified) {
          toast({
            title: `${doc.title} is due today`,
            description: `Action needed for ${doc.provider || 'this document'}`,
            variant: 'default',
          });
          updateReminderNotified(doc.id, 'on_due_date');
        }
      });
    } catch (error) {
      console.error('Failed to check reminders:', error);
    }
  }, [auth?.user?.uid]);

  const updateReminderNotified = async (docId: string, reminderType: string) => {
    try {
      // In a real implementation, this would update the document in Firestore
      // For now, we'll just mark it locally
      console.log(`Marked reminder "${reminderType}" as notified for document ${docId}`);
    } catch (error) {
      console.error('Failed to update reminder:', error);
    }
  };

  // Check reminders every hour
  useEffect(() => {
    checkReminders();
    const interval = setInterval(() => {
      checkReminders();
    }, 60 * 60 * 1000); // 1 hour

    return () => clearInterval(interval);
  }, [checkReminders]);

  return { checkReminders };
}
