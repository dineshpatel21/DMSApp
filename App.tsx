import { View, Text } from 'react-native'
import React from 'react'
import { Provider } from 'react-redux'
import { store } from './src/redux/Store'
import Navigator from './src/navigation/Navigator'

const App = () => {
  return (
  <Provider store={store} >
    <Navigator/>
  </Provider>
   
  )
}

export default App