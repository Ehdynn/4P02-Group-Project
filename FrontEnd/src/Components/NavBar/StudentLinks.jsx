import { Link } from 'react-router-dom';

const StudentLinks = ({ onJoinCourse }) => {
  const handleJoinClick = () => {
    if (onJoinCourse) {
      onJoinCourse();
    }
  };

  return (
    <>
      <button
        type="button"
        className='link-default'
        onClick={handleJoinClick}
      >
        Join Course
      </button>
    </>
  )
}

export default StudentLinks
