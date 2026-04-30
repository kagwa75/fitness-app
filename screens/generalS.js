import { View, Text, Switch } from 'react-native'
import React, { useEffect, useState } from 'react'
import * as SecureStore from 'expo-secure-store'
import { clearStreakReminder } from '../utils/notifications'
import { SafeAreaView } from 'react-native-safe-area-context'

const generalS = ({ route }) => {
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    useEffect(() => {
      const load = async () => {
        const raw = await SecureStore.getItemAsync('notifications_enabled');
        if (raw != null) setNotificationsEnabled(raw === 'true');
      };
      load();
    }, []);

    useEffect(() => {
      SecureStore.setItemAsync('notifications_enabled', String(notificationsEnabled));
      if (!notificationsEnabled) {
        clearStreakReminder();
      }
    }, [notificationsEnabled]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#121212' }}>
      <View style={styles.settingRow}>
    <View>
      <Text style={styles.settingTitle}>Notifications</Text>
      <Text style={styles.settingSubtitle}>Workout reminders and updates</Text>
    </View>
    <Switch
      value={notificationsEnabled}
      onValueChange={setNotificationsEnabled}
      trackColor={{ true: '#00E5BE', false: '#3A3A4A' }}
      thumbColor="#fff"
    />
  </View>

    </SafeAreaView>
  )
}

export default generalS
const styles = {
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 15,
      paddingHorizontal: 20,
      backgroundColor: '#1E1E1E',
      borderRadius: 10,
      marginBottom: 15,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#fff',
    },
    settingSubtitle: {
      fontSize: 12,
      color: '#888',
    },
  };
