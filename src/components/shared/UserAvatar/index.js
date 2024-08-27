import { Avatar } from '@material-ui/core'
import React from 'react'
import { videoShadow } from '../../../utils'
import { profile } from '../../../store/reducers/profile';


const UserAvatar = ({isFilmstrip, audioLevel, audioIndicatorActiveClasses, participantDetails}) => {

  let avatarColor = participantDetails?.avatar || profile?.color;

  return (
    <Avatar
            src={null}
            style={
              isFilmstrip
                ? {
                    boxShadow: videoShadow(audioLevel),
                    background: avatarColor,
                  }
                : { background: avatarColor }
            }
            className={audioIndicatorActiveClasses}
          >
            {participantDetails?.name?.slice(0, 1)?.toUpperCase()}
          </Avatar>
  )
}

export default UserAvatar