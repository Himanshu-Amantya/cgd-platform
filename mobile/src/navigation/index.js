import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Feather } from '@expo/vector-icons'
import { C } from '../theme'

import LoginScreen    from '../screens/LoginScreen'
import OtpScreen      from '../screens/OtpScreen'
import HomeScreen     from '../screens/HomeScreen'
import BillsScreen    from '../screens/BillsScreen'
import BillDetailScreen from '../screens/BillDetailScreen'
import SupportScreen  from '../screens/SupportScreen'
import ProfileScreen  from '../screens/ProfileScreen'

const Stack = createNativeStackNavigator()
const Tab   = createBottomTabNavigator()

function TabIcon({ name, color, size }) {
  return <Feather name={name} size={size} color={color} />
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#fff', elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: C.g100 },
        headerTitleStyle: { fontSize: 17, fontWeight: '900', color: C.g900, letterSpacing: -.4 },
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: C.g100, borderTopWidth: 1, height: 88, paddingBottom: 28, paddingTop: 10 },
        tabBarActiveTintColor: C.blueMid,
        tabBarInactiveTintColor: C.g300,
        tabBarLabelStyle: { fontSize: 10.5, fontWeight: '800', marginTop: 2, letterSpacing: .2 },
      }}>
      <Tab.Screen name="Home" component={HomeScreen}
        options={{ title: 'Dashboard', tabBarLabel: 'Home', tabBarIcon: ({ color, size }) => <TabIcon name="home" color={color} size={size} /> }} />
      <Tab.Screen name="Bills" component={BillsStack}
        options={{ headerShown: false, tabBarLabel: 'Bills', tabBarIcon: ({ color, size }) => <TabIcon name="file-text" color={color} size={size} /> }} />
      <Tab.Screen name="Support" component={SupportScreen}
        options={{ title: 'Support', tabBarLabel: 'Support', tabBarIcon: ({ color, size }) => <TabIcon name="message-circle" color={color} size={size} /> }} />
      <Tab.Screen name="Profile" component={ProfileScreen}
        options={{ title: 'My Account', tabBarLabel: 'Profile', tabBarIcon: ({ color, size }) => <TabIcon name="user" color={color} size={size} /> }} />
    </Tab.Navigator>
  )
}

function BillsStack() {
  return (
    <Stack.Navigator screenOptions={{
      headerStyle: { backgroundColor: '#fff' },
      headerTitleStyle: { fontSize: 16, fontWeight: '800', color: C.g900 },
      headerTintColor: C.blueMid,
    }}>
      <Stack.Screen name="BillsList" component={BillsScreen} options={{ title: 'My Bills' }} />
      <Stack.Screen name="BillDetail" component={BillDetailScreen} options={{ title: 'Bill Detail' }} />
    </Stack.Navigator>
  )
}

export default function AppNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth"  component={AuthStack} />
        <Stack.Screen name="Main"  component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Otp"   component={OtpScreen} />
    </Stack.Navigator>
  )
}
