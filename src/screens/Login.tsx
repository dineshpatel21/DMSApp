import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { url } from '../../Const';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1 = phone input, 2 = OTP input
  const [loading, setLoading] = useState(false);

  //send otp
  const sendOtp = async () => {
    if (!phone) return Alert.alert('Error', 'Please enter your phone number');
    try {
      setLoading(true);
      const response = await fetch(`${url}generateOTP`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      const res = await response.json();
    
      if (!response.ok) {
        throw new Error(res.message || 'Failed to send OTP');
      }

      Alert.alert('OTP Sent', 'Check your SMS for the OTP.');
      setStep(2);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  //verify otp
  const verifyOtp = async () => {
    if (!otp) return Alert.alert('Error', 'Please enter OTP');
    try {
      setLoading(true);
      const response = await fetch(`${url}validateOTP`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, otp }),
      });

      const res = await response.json();

      if (!response.ok) {
        throw new Error(res.message || 'Invalid OTP');
      }

      const token = res.token;
      await AsyncStorage.setItem('authToken', token);
      Alert.alert('Login Successful', 'Token saved for future requests.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };


  return (
    <View style={styles.container}>
      {step === 1 ? (
        <>
          <Text style={styles.label}>Enter Mobile Number</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 9876543210"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          <TouchableOpacity style={styles.button} onPress={sendOtp} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send OTP'}</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.label}>Enter OTP</Text>
          <TextInput
            style={styles.input}
            placeholder="123456"
            keyboardType="number-pad"
            value={otp}
            onChangeText={setOtp}
          />
          <TouchableOpacity style={styles.button} onPress={verifyOtp} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Verify OTP'}</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  label: { fontSize: 18, marginBottom: 8, fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, marginBottom: 15 },
  button: { backgroundColor: '#007bff', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16 }
});

export default Login