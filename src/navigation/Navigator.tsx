import { NavigationContainer, useNavigation, NavigationProp } from "@react-navigation/native"
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from "../screens/Login";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import UploadFiles from "../screens/UploadFiles";
import SearchAndPreview from "../screens/SearchAndPreview";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";

const Stack = createNativeStackNavigator();
const Tab = createMaterialTopTabNavigator();

const TopTab = () => {
    const [modalVisible, setModalVisible] = useState(false)
    const navigation: any = useNavigation();
    const handleLogout = async () => {
        await AsyncStorage.clear();
        navigation?.replace("Login");
    }
    return (
        <>
            <Tab.Navigator
                screenOptions={{
                    tabBarActiveTintColor: "#fff",
                    tabBarLabelStyle: { fontSize: 14, fontWeight: "bold", color: '#000' },
                    tabBarStyle: { backgroundColor: "#fff" },
                }}
            >
                <Tab.Screen name="UploadFiles" component={UploadFiles} />
                <Tab.Screen name="SearchAndPreview" component={SearchAndPreview} />
            </Tab.Navigator>
            <TouchableOpacity
                onPress={() => { setModalVisible(true) }}
                style={{
                    backgroundColor: '#FF4B4B',
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                    marginHorizontal:10,
                    borderRadius: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 3,
                    elevation: 3,
                }}
            >
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                    Logout
                </Text>
            </TouchableOpacity>
            <Modal
                transparent
                visible={modalVisible}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.title}>Are you sure you want to logout?</Text>
                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: "green" }]}
                                onPress={handleLogout}
                            >
                                <Text style={styles.buttonText}>Yes</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: "gray" }]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.buttonText}>No</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    )
}

const Navigator = () => {

    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName='TopTab' screenOptions={{ headerShown: false, animation: 'none' }}>
                <Stack.Screen name='Login' component={Login} />
                <Stack.Screen name='TopTab' component={TopTab} />
            </Stack.Navigator>
        </NavigationContainer>
    )
}


const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)"
    },
    modalContainer: {
        backgroundColor: "white",
        padding: 20,
        borderRadius: 10,
        width: 300,
        alignItems: "center"
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center"
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%"
    },
    button: {
        flex: 1,
        padding: 10,
        marginHorizontal: 5,
        borderRadius: 5,
        alignItems: "center"
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold"
    }
});
export default Navigator