import { Link } from 'react-router-dom';

const StudentLinks = () => {
  return (
    <>
      <Link to={'/JoinCourse'} className="py-5 px-3 text-gray-300 hover:bg-gray-700 hover:text-white transition duration-300">
      Join Course
      </Link>
    </>
  )
}

export default StudentLinks