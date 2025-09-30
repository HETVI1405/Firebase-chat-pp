// import { createSlice } from '@reduxjs/toolkit'

// const chatSlice = createSlice({
//   name: 'chat',
//   initialState: { messages: [], selectedUser: null },
//   reducers: {
//     setMessages: (state, action) => { state.messages = action.payload },
//     addMessage: (state, action) => { state.messages.push(action.payload) },
//     setSelectedUser: (state, action) => { state.selectedUser = action.payload }
//   }
// })

// export const { setMessages, addMessage, setSelectedUser } = chatSlice.actions
// export default chatSlice.reducer
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// async thunk
export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (userId) => {
    const res = await fetch(`/api/messages/${userId}`);
    return await res.json();
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    messages: [],
    selectedUser: null,
    status: "idle",   // idle | loading | succeeded | failed
    error: null
  },
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  }
});

export const { setMessages, addMessage, setSelectedUser } = chatSlice.actions;
export default chatSlice.reducer;
