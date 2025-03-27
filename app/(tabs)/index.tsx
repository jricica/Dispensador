import { useState, useEffect } from 'react';
import { Image, StyleSheet, View, TouchableOpacity, Text, Alert, ActivityIndicator, FlatList, SafeAreaView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

const ARDUINO_IP = "http://192.168.1.28";

export default function HomeScreen() {
  const [isOn, setIsOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [actionHistory, setActionHistory] = useState<string[]>([]);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch(`${ARDUINO_IP}/status`, { method: "GET" });
        setIsConnected(response.ok);
      } catch {
        setIsConnected(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleDispenser = async () => {
    setLoading(true);
    const action = isOn ? "off" : "on";
    try {
      const response = await fetch(`${ARDUINO_IP}/${action}`, { method: "GET" });
      if (!response.ok) throw new Error("Error en la conexión");

      setIsOn(!isOn);
      setActionHistory((prev) => [`${new Date().toLocaleTimeString()}: ${isOn ? 'Apagado' : 'Encendido'}`, ...prev]);
    } catch (error) {
      Alert.alert("Error", "No se pudo conectar con el dispensador. Verifica la conexión WiFi.");
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={actionHistory}
        keyExtractor={(_item, index) => index.toString()}
        ListHeaderComponent={
          <>
            <View style={styles.headerContainer}>
              <Image source={require('@/assets/images/dispenser.jpg')} style={styles.headerImage} resizeMode="cover" />
            </View>

            <ThemedView style={styles.container}>
              <ThemedText type="title" style={styles.title}>Control del Dispensador</ThemedText>

              <View style={styles.statusContainer}>
                <ThemedText type="subtitle" style={styles.statusText}>
                  Estado: {isOn ? '🟢 Encendido' : '🔴 Apagado'}
                </ThemedText>
                <ThemedText type="subtitle" style={styles.connectionText}>
                  Conexión: {isConnected ? '✅ Conectado' : '❌ Desconectado'}
                </ThemedText>
              </View>

              {loading ? (
                <ActivityIndicator size="large" color="#00796B" />
              ) : (
                <TouchableOpacity style={[styles.button, isOn ? styles.buttonOn : styles.buttonOff]} onPress={toggleDispenser}>
                  <Text style={styles.buttonText}>{isOn ? 'Apagar' : 'Encender'}</Text>
                </TouchableOpacity>
              )}

              <ThemedView style={styles.stepContainer}>
                <ThemedText type="subtitle" style={styles.subtitle}>Instrucciones</ThemedText>
                <ThemedText style={styles.instructions}>🌊 Pulsa el botón para encender o apagar el dispensador.</ThemedText>
                <ThemedText style={styles.instructions}>📶 Asegúrate de estar en la misma red WiFi que el ESP32.</ThemedText>
              </ThemedView>

              <ThemedView style={styles.historyContainer}>
                <ThemedText type="subtitle" style={styles.subtitle}>Historial de Acciones</ThemedText>
              </ThemedView>
            </ThemedView>
          </>
        }
        renderItem={({ item }) => <ThemedText style={styles.historyItem}>{item}</ThemedText>}
        contentContainerStyle={styles.flatListContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E0F7FA',
  },
  flatListContent: {
    paddingBottom: 20,
  },
  headerContainer: {
    width: '100%',
    height: 200,
    overflow: 'hidden',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#E0F7FA',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#00796B',
    marginBottom: 10,
  },
  statusContainer: {
    padding: 12,
    backgroundColor: '#FFEB3B',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3E2723',
  },
  connectionText: {
    fontSize: 16,
    color: '#004D40',
    marginTop: 5,
  },
  button: {
    width: 200,
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 5,
    elevation: 5,
    marginVertical: 10,
  },
  buttonOn: {
    backgroundColor: '#4CAF50',
  },
  buttonOff: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00796B',
    marginBottom: 8,
  },
  instructions: {
    fontSize: 16,
    color: '#004D40',
  },
  historyContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
    width: '100%',
  },
  historyItem: {
    fontSize: 16,
    color: '#004D40',
    marginBottom: 5,
  },
});

