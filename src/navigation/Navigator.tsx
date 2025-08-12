import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from "../screens/Login";

const Stack = createNativeStackNavigator();

const Navigator = () => {
    return <NavigationContainer>
        <Stack.Navigator initialRouteName='Login' screenOptions={{ headerShown: false, animation: 'none' }}>
            <Stack.Screen name='Login' component={Login} />
        </Stack.Navigator>
    </NavigationContainer>
}
export default Navigator