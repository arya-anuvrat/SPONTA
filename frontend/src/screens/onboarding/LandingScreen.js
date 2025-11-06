import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function LandingScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>SPONTA</Text>
      <Text style={styles.subtitle}>Gamified Spontaneity for College Students</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.createAccountButton}
          onPress={() => navigation.navigate('CreateAccount')}
        >
          <Text style={styles.createAccountButtonText}>CREATE ACCOUNT</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.signInButton}
          onPress={() => navigation.navigate('SignIn')}
        >
          <Text style={styles.signInButtonText}>SIGN IN</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 50,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 350,
  },
  createAccountButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  createAccountButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signInButton: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#007AFF',
    alignItems: 'center',
  },
  signInButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

