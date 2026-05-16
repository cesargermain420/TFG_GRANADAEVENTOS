import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackParamList } from '../types/navigation';

import CrearEventoScreen from '../screens/CrearEventoScreen';
import DetalleEventoScreen from '../screens/DetalleEventoScreen';
import FavoritosScreen from '../screens/FavoritosScreen';
import HomeScreen from '../screens/HomeScreen';
import InfoScreen from '../screens/InfoScreen';
import LoginScreen from '../screens/LoginScreen';
import BlogScreen from '../screens/BlogScreen';
import ComerScreen from '../screens/ComerScreen';
import { colors } from '../theme';

//NAVEGACION ENTRE PANTALLAS
const Tab = createBottomTabNavigator<RootStackParamList>();

const HIDDEN: React.ComponentProps<typeof Tab.Screen>['options'] = {
  tabBarButton: () => null,
  tabBarItemStyle: { width: 0, flex: 0, overflow: 'hidden', padding: 0, margin: 0 },
};


export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: true,
          tabBarStyle: {
            height: 82,
            paddingBottom: 12,
            paddingTop: 8,
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#e2e8f0',
          },
          tabBarItemStyle: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            marginTop: 2,
          },
          tabBarIcon: ({ focused, color }) => {
            let iconName: keyof typeof Ionicons.glyphMap;
            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Blog') {
              iconName = focused ? 'book' : 'book-outline';
            } else if (route.name === 'Favoritos') {
              iconName = focused ? 'heart' : 'heart-outline';
            } else if (route.name === 'Comer') {
              iconName = focused ? 'restaurant' : 'restaurant-outline';
            } else if (route.name === 'Info') {
              iconName = focused ? 'information-circle' : 'information-circle-outline';
            } else {
              iconName = 'ellipse';
            }
            return <Ionicons name={iconName} size={24} color={color} />;
          },
          tabBarActiveTintColor: colors.brand,
          tabBarInactiveTintColor: colors.textMuted,
        })}
      >
        {/* PESTAÑAS VISIBLES */}
        <Tab.Screen name="Home"      component={HomeScreen}      options={{ tabBarLabel: 'Inicio' }} />
        <Tab.Screen name="Blog"      component={BlogScreen}      options={{ tabBarLabel: 'Blog' }} />
        <Tab.Screen name="Favoritos" component={FavoritosScreen} options={{ tabBarLabel: 'Favoritos' }} />
        <Tab.Screen name="Comer"     component={ComerScreen}     options={{ tabBarLabel: 'Comer' }} />
        <Tab.Screen name="Info"      component={InfoScreen}      options={{ tabBarLabel: 'Ayuda' }} />

        {/* PANTALLAS SIN PESTAÑA, SOLO APARECEN AL ENTRAR A AELLAS*/}
        <Tab.Screen name="Login"        component={LoginScreen}        options={HIDDEN} />
        <Tab.Screen name="DetalleEvento" component={DetalleEventoScreen} options={HIDDEN} />
        <Tab.Screen name="CrearEvento"  component={CrearEventoScreen}  options={HIDDEN} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
