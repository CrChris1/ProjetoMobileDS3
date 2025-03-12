import React, { useEffect, useState } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { createStore } from 'redux';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Actions
const START = 'START';
const STOP = 'STOP';
const RESET = 'RESET';
const TICK = 'TICK';
const SET_TIME = 'SET_TIME';
const INCREMENT = 'INCREMENT';
const DECREMENT = 'DECREMENT';

const start = () => ({ type: START });
const stop = () => ({ type: STOP });
const reset = () => ({ type: RESET });
const tick = () => ({ type: TICK });
const setTime = (hours, minutes, seconds) => ({ type: SET_TIME, payload: { hours, minutes, seconds } });
const increment = () => ({ type: INCREMENT });
const decrement = () => ({ type: DECREMENT });

const initialState = { hours: 0, minutes: 0, seconds: 0, running: false, totalSeconds: 0 };
const timerReducer = (state = initialState, action) => {
  switch (action.type) {
    case START:
      return { ...state, running: true };
    case STOP:
      return { ...state, running: false };
    case RESET:
      return { ...state, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, running: false };
    case SET_TIME:
      const totalTimeInSeconds = action.payload.hours * 3600 + action.payload.minutes * 60 + action.payload.seconds;
      return { ...state, ...action.payload, totalSeconds: totalTimeInSeconds };
    case TICK:
      if (!state.running || state.totalSeconds <= 0) return state;
      const remainingTime = state.totalSeconds - 1;
      const hours = Math.floor(remainingTime / 3600);
      const minutes = Math.floor((remainingTime % 3600) / 60);
      const seconds = remainingTime % 60;
      return { ...state, hours, minutes, seconds, totalSeconds: remainingTime };
    case INCREMENT:
      const incrementedTotalSeconds = state.totalSeconds + 1;
      const incrementedHours = Math.floor(incrementedTotalSeconds / 3600);
      const incrementedMinutes = Math.floor((incrementedTotalSeconds % 3600) / 60);
      const incrementedSeconds = incrementedTotalSeconds % 60;
      return { ...state, hours: incrementedHours, minutes: incrementedMinutes, seconds: incrementedSeconds, totalSeconds: incrementedTotalSeconds };
    case DECREMENT:
      if (state.totalSeconds > 0) {
        const decrementedTotalSeconds = state.totalSeconds - 1;
        const decrementedHours = Math.floor(decrementedTotalSeconds / 3600);
        const decrementedMinutes = Math.floor((decrementedTotalSeconds % 3600) / 60);
        const decrementedSeconds = decrementedTotalSeconds % 60;
        return { ...state, hours: decrementedHours, minutes: decrementedMinutes, seconds: decrementedSeconds, totalSeconds: decrementedTotalSeconds };
      }
      return state;
    default:
      return state;
  }
};

const store = createStore(timerReducer);

const Timer = () => {
  const { hours, minutes, seconds, running } = useSelector((state) => state);
  const dispatch = useDispatch();
  const [inputHours, setInputHours] = useState('0');
  const [inputMinutes, setInputMinutes] = useState('0');
  const [inputSeconds, setInputSeconds] = useState('0');

  useEffect(() => {
    let interval;
    if (running && (hours > 0 || minutes > 0 || seconds > 0)) {
      interval = setInterval(() => {
        dispatch(tick());
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [running, dispatch, hours, minutes, seconds]);

  const formatTime = (num) => String(num).padStart(2, '0');

  return (
    <View style={styles.timerContainer}>
      <Text style={styles.timerText}>{`${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}`}</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={inputHours}
          onChangeText={setInputHours}
          placeholder="HH"
        />
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={inputMinutes}
          onChangeText={setInputMinutes}
          placeholder="MM"
        />
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={inputSeconds}
          onChangeText={setInputSeconds}
          placeholder="SS"
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            dispatch(setTime(parseInt(inputHours) || 0, parseInt(inputMinutes) || 0, parseInt(inputSeconds) || 0))
          }>
          <Text style={styles.buttonText}>Definir Time</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, { backgroundColor: running ? '#e74c3c' : '#27ae60' }]} onPress={() => dispatch(running ? stop() : start())}>
          <Text style={styles.buttonText}>{running ? 'Pausar' : 'Iniciar'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => dispatch(reset())}>
          <Text style={styles.buttonText}>Resetar</Text>
        </TouchableOpacity>

        {/* Botão de Incrementar */}
        <TouchableOpacity style={styles.button} onPress={() => dispatch(increment())}>
          <Text style={styles.buttonText}>Incrementar</Text>
        </TouchableOpacity>

        {/* Botão de Decrementar */}
        <TouchableOpacity style={styles.button} onPress={() => dispatch(decrement())}>
          <Text style={styles.buttonText}>Decrementar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ScreenOne = ({ navigation }) => (
  <View style={styles.screenLight}>
    <Timer />
    <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('ScreenTwo')}>
      <Text style={styles.navButtonText}>Ir para Tela 2</Text>
    </TouchableOpacity>
  </View>
);

const ScreenTwo = ({ navigation }) => (
  <View style={styles.screenDark}>
    <Timer />
    <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('ScreenOne')}>
      <Text style={styles.navButtonText}>Ir para Tela 1</Text>
    </TouchableOpacity>
  </View>
);

const Stack = createStackNavigator();

const App = () => (
  <Provider store={store}>
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ScreenOne" component={ScreenOne} />
        <Stack.Screen name="ScreenTwo" component={ScreenTwo} />
      </Stack.Navigator>
    </NavigationContainer>
  </Provider>
);

const styles = StyleSheet.create({
  timerContainer: {
    alignItems: 'center',
    margin: 30,
    padding: 40,
    backgroundColor: 'linear-gradient(135deg, #FF5C8D, #8360C3)',
    borderRadius: 20,
    width: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#fff',
  },
  timerText: {
    fontSize: 48, // Diminuído para tamanho menor
    fontWeight: '700',
    color: '#ecf0f1',
    letterSpacing: 5,
    marginBottom: 25,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 25,
    justifyContent: 'center',
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    padding: 15,
    marginHorizontal: 8,
    width: 80,
    textAlign: 'center',
    fontSize: 22, // Diminuído para ajuste
    borderRadius: 12,
    backgroundColor: 'rgba(52, 152, 219, 0.7)',
    color: '#ecf0f1',
    fontWeight: '600',
    boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
  },
  buttonContainer: {
    marginVertical: 30,
    width: '100%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#16a085',
    paddingVertical: 18,
    paddingHorizontal: 45,
    marginBottom: 15,
    borderRadius: 50,
    width: 240,
    alignItems: 'center',
    elevation: 5,
    transition: 'all 0.3s ease',
  },
  buttonText: {
    color: '#ecf0f1',
    fontSize: 18, // Diminuído para ajuste
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  buttonHover: {
    backgroundColor: '#1abc9c',
  },
  screenLight: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingTop: 20,
    background: 'linear-gradient(180deg, #fff, #f0f0f0)',
  },
  screenDark: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#34495e',
    background: 'linear-gradient(180deg, #2c3e50, #34495e)',
  },
  navButton: {
    marginTop: 20,
    backgroundColor: '#2980b9',
    paddingVertical: 18,
    paddingHorizontal: 45,
    borderRadius: 50,
    width: 240,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
    transition: 'all 0.3s ease',
  },
  navButtonText: {
    color: '#ecf0f1',
    fontSize: 18, // Diminuído para ajuste
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  navButtonHover: {
    backgroundColor: '#3498db',
  },
});

export default App;
