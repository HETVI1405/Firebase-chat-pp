import { configureStore } from '@reduxjs/toolkit'
import usersReducer from './slices/usersSlice'
import chatReducer from './slices/chatSlice'

const store = configureStore({
  reducer: {
    users: usersReducer,
    chat: chatReducer
  }
})

export default store