import { Link } from 'react-router-dom';

const InstructorLinks = () => {
  return (
    <>
    <Link to="/CreateCourse" className="py-5 px-3 text-gray-300 hover:bg-gray-700 hover:text-white transition duration-300">
        Create A Course
    </Link> 
</>
  )
}

export default InstructorLinks