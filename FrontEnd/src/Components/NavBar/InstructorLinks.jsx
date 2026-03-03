import { Link } from 'react-router-dom';

const InstructorLinks = () => {
  return (
    <>
        <Link to="/CreateCourse" className="link-default">
            Create Course
        </Link> 
        <Link to="/CreateAssignment" className="link-default">
            Create Assignment
        </Link>
    </>
  )
}

export default InstructorLinks