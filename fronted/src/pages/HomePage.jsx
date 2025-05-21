import React from 'react'
import { useUser } from '../contexts/UserContext';

const HomePage = () => {
    const {user} = useUser();
    console.log(user)
  return (
    <div>
      welcome , user: {user.username}
    </div>
  )
}

export default HomePage
