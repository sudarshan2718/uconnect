import { BrowserRouter as Router, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import Forgot from './components/Forgot'
import Home from './components/Home'
import SignIn from './components/SignIn'
import SignUp from './components/SignUp'
import PostForgot from './components/postForgot'
import Confirm from './components/Confirm'
import Settings from './components/Settings'
import Dashboard from './components/Dashboard'
import Schools from './components/Schools'
import { Threads, Chat } from './components/Threads'
import EditProfile from './components/EditProfile'
import { Amplify, Auth } from 'aws-amplify'
import Change from './components/Change'
import { useEffect, useRef, useState } from 'react'

Amplify.configure({
  Auth: {
    region: import.meta.env.VITE_REGION,
    userPoolId: import.meta.env.VITE_POOL_ID,
    userPoolWebClientId: import.meta.env.VITE_CLIENT_ID,
    authenticationFlowType: import.meta.env.VITE_AUTH_FLOW_TYPE,
  }
})




function App() {

  return (
    <Router>
      <Routes>
        <Route path='signin' element={<SignIn />} />
        <Route path='signup' element={<SignUp />} />
        <Route path='forgot' element={<Forgot />} />
        <Route path='confirm' element={<Confirm />} />
        <Route path='postforgot' element={<PostForgot />} />
        
        <Route path='/' element={<Home />}>
          <Route index element={<Dashboard />} />
          <Route path='settings' element={<Settings />} />
          <Route path='schools' element={<Schools />} />
          <Route path='threads' element={<Threads />} >
            <Route path=':tid' element={<Chat />} />
          </Route>
          <Route path='edit' element={<EditProfile />} />
          <Route path='change' element={<Change />} />

          <Route path='*' element={<Navigate replace to="/" />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
