import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

const ARDUINO_IP = "http://192.168.1.28";

const initialDrinks = [
  {
    id: '1',
    name: 'Margarita',
    description: 'Tequila, triple sec, jugo de lima y sal.',
    action: 'margarita',
    servedCount: 0,
    totalMilliliters: 0,
    status: 'disponible', // Estado inicial
  },
  {
    id: '2',
    name: 'Mojito',
    description: 'Ron, hierbabuena, azúcar, lima y soda.',
    action: 'mojito',
    servedCount: 0,
    totalMilliliters: 0,
    status: 'disponible', // Estado inicial
  },
  {
    id: '3',
    name: 'Piña Colada',
    description: 'Ron, crema de coco y jugo de piña.',
    action: 'pina_colada',
    servedCount: 0,
    totalMilliliters: 0,
    status: 'disponible', // Estado inicial
  },
];

export default function DrinksScreen() {
  const [loadingDrink, setLoadingDrink] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [drinks, setDrinks] = useState(initialDrinks);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const serveDrink = async (action: string) => {
    setLoadingDrink(action);
    setStatusMessage(null);

    // Actualizar el estado a "se está sirviendo"
    setDrinks((prevDrinks) =>
      prevDrinks.map((drink) =>
        drink.action === action ? { ...drink, status: 'se está sirviendo' } : drink
      )
    );

    try {
      const response = await fetch(`${ARDUINO_IP}/serve/${action}`, { method: 'GET' });
      if (!response.ok) throw new Error('No se pudo conectar con el dispensador.');

      // Actualizar el estado a "servido" y los contadores
      setDrinks((prevDrinks) =>
        prevDrinks.map((drink) =>
          drink.action === action
            ? {
                ...drink,
                servedCount: drink.servedCount + 1,
                totalMilliliters: drink.totalMilliliters + 250, // Asumimos 250 ml por trago
                status: 'servido',
              }
            : drink
        )
      );

      setStatusMessage('La bebida ha sido servida.');
    } catch (error) {
      setStatusMessage('Error: No se pudo conectar con el dispensador. Verifica la conexión.');
      // Revertir el estado a "disponible" en caso de error
      setDrinks((prevDrinks) =>
        prevDrinks.map((drink) =>
          drink.action === action ? { ...drink, status: 'disponible' } : drink
        )
      );
    }
    setLoadingDrink(null);
  };

  const refreshDrinks = () => {
    setRefreshing(true);
    setTimeout(() => {
      setDrinks([...initialDrinks]);
      setRefreshing(false);
    }, 1500);
  };

  const resetCounts = () => {
    setDrinks((prevDrinks) =>
      prevDrinks.map((drink) => ({
        ...drink,
        servedCount: 0,
        totalMilliliters: 0,
        status: 'disponible', // Reiniciar el estado
      }))
    );
    setStatusMessage('Las cuentas han sido reseteadas.');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Bebidas Disponibles</ThemedText>

      {statusMessage && <ThemedText style={styles.statusMessage}>{statusMessage}</ThemedText>}

      <FlatList
        data={drinks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.drinkCard}>
            <ThemedText type="subtitle" style={styles.drinkName}>{item.name}</ThemedText>
            <ThemedText style={styles.drinkDescription}>{item.description}</ThemedText>
            <ThemedText style={styles.drinkStats}>
              Servidos: {item.servedCount} | Total: {item.totalMilliliters} ml
            </ThemedText>
            <ThemedText style={styles.drinkStatus}>Estado: {item.status}</ThemedText>

            {loadingDrink === item.action ? (
              <ActivityIndicator size="large" color="#00796B" />
            ) : (
              <TouchableOpacity style={styles.button} onPress={() => serveDrink(item.action)}>
                <Text style={styles.buttonText}>Servir</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        contentContainerStyle={styles.flatListContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshDrinks} colors={['#00796B']} />
        }
      />

      <TouchableOpacity style={styles.resetButton} onPress={resetCounts}>
        <Text style={styles.resetButtonText}>Resetear Cuentas</Text>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F7FA',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00796B',
    marginBottom: 20,
  },
  flatListContent: {
    paddingBottom: 20,
  },
  drinkCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
  },
  drinkName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#00796B',
    marginBottom: 5,
  },
  drinkDescription: {
    fontSize: 16,
    color: '#004D40',
    textAlign: 'center',
    marginBottom: 15,
  },
  drinkStats: {
    fontSize: 14,
    color: '#004D40',
    marginBottom: 10,
  },
  drinkStatus: {
    fontSize: 14,
    color: '#004D40',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#FF9800',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  resetButton: {
    backgroundColor: '#D32F2F',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginTop: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
  },
  resetButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statusMessage: {
    fontSize: 16,
    color: '#00796B',
    marginBottom: 10,
    textAlign: 'center',
  },
});
