import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, SafeAreaView, ImageBackground, Button } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import {useNetInfo} from "@react-native-community/netinfo";


const SplashScreen = ({navigation}) => {

const netInfo = useNetInfo();

  return (
    <View style={styles.container}>
      
      <View style={styles.header}>
      </View>
      <Animatable.View style={styles.footer} animation = {"fadeInUpBig"}>
        {
          netInfo.isConnected ? <Text>Estás conectado</Text> : <Text>No hay internet</Text>
        }
        <Button onPress={()=>navigation.navigate('Home')} title="Iniciar"></Button>
      </Animatable.View>
    </View>
  );
}

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'red'
  },
  footer: {
    flex:1,
    justifyContent: 'center',
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingVertical: 50,
    paddingHorizontal: 30,
},
});
