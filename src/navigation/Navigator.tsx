import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from "../screens/Login";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import UploadFiles from "../screens/UploadFiles";
import SearchAndPreview from "../screens/SearchAndPreview";

const Stack = createNativeStackNavigator();
const Tab = createMaterialTopTabNavigator();

const TopTab = () => {
    return <Tab.Navigator
        screenOptions={{
            tabBarActiveTintColor: "#fff",
            tabBarLabelStyle: { fontSize: 14, fontWeight: "bold",color:'#000' },
            tabBarStyle: { backgroundColor: "#fff" },
        }}
    >
        <Tab.Screen name="UploadFiles" component={UploadFiles} />
        <Tab.Screen name="SearchAndPreview" component={SearchAndPreview} />
    </Tab.Navigator>
}

const Navigator = () => {
    return <NavigationContainer>
        <Stack.Navigator initialRouteName='TopTab' screenOptions={{ headerShown: false, animation: 'none' }}>
            <Stack.Screen name='Login' component={Login} />
            <Stack.Screen name='TopTab' component={TopTab} />
        </Stack.Navigator>
    </NavigationContainer>
}
export default Navigator