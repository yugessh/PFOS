'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthContext } from '@/src/context/AuthContext';
import {
  DEFAULT_NOTIFICATION_MODULES,
  notificationSettingsService,
  type NotificationModulePreference,
  type NotificationSettingsModel,
} from '@/src/services/firestore/notification-settings.service';
import type { NotificationModule, NotificationPriority } from '@/src/lib/notifications';

export function useNotificationSettings() {
  const auth = useAuthContext();
  const [settings, setSettings] = useState<NotificationSettingsModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    const userId = auth?.user?.uid;
    if (!userId) {
      setSettings(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const nextSettings = await notificationSettingsService.getUserNotificationSettings(userId);
      setSettings(nextSettings);
      setError(null);
    } catch (loadError) {
      console.error('Error loading notification settings:', loadError);
      setError('Failed to load notification settings');
    } finally {
      setLoading(false);
    }
  }, [auth?.user?.uid]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const saveSettings = useCallback(async (nextSettings: Partial<NotificationSettingsModel>) => {
    const userId = auth?.user?.uid;
    if (!userId) return;

    try {
      setSaving(true);
      await notificationSettingsService.saveUserNotificationSettings(userId, nextSettings);
      await loadSettings();
      setError(null);
    } catch (saveError) {
      console.error('Error saving notification settings:', saveError);
      setError('Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  }, [auth?.user?.uid, loadSettings]);

  const toggleModule = useCallback(async (module: NotificationModule, enabled: boolean) => {
    if (!settings) return;
    await saveSettings({
      modules: {
        ...settings.modules,
        [module]: {
          ...(settings.modules[module] || { enabled: true, sound: true, push: true }),
          enabled,
        },
      },
    });
  }, [saveSettings, settings]);

  const updateModulePreference = useCallback(async (module: NotificationModule, preference: Partial<NotificationModulePreference>) => {
    if (!settings) return;
    await saveSettings({
      modules: {
        ...settings.modules,
        [module]: {
          ...(settings.modules[module] || { enabled: true, sound: true, push: true }),
          ...preference,
        },
      },
    });
  }, [saveSettings, settings]);

  const setPriorityOverride = useCallback(async (module: NotificationModule, priority: NotificationPriority | null) => {
    if (!settings) return;
    const nextOverride = { ...settings.priorityOverride };
    if (priority) {
      nextOverride[module] = priority;
    } else {
      delete nextOverride[module];
    }

    await saveSettings({ priorityOverride: nextOverride });
  }, [saveSettings, settings]);

  const moduleSettings = useMemo(() => {
    const normalized = settings?.modules || DEFAULT_NOTIFICATION_MODULES.reduce((accumulator, module) => {
      accumulator[module] = { enabled: true, sound: true, push: true };
      return accumulator;
    }, {} as Record<NotificationModule, NotificationModulePreference>);
    return normalized;
  }, [settings?.modules]);

  return {
    settings,
    moduleSettings,
    loading,
    saving,
    error,
    loadSettings,
    saveSettings,
    toggleModule,
    updateModulePreference,
    setPriorityOverride,
  };
}
