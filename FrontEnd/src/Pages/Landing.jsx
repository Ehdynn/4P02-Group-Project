import useUser from "../context/useUser"

const Landing = () => {
  const {isProfessor, roleReady } = useUser();
  return (
    <main className="outer-container-3qw">
      <h1 className="h1-default text-center">Team Won Code Comparison</h1>
      <div className="flex w-full space-x-5 flex-col md:flex-row">
        <div className="flex-1 min-w-0">
          <div className="box-wrapper">
            <h2 className="h2-large text-center">Instructors</h2>
            <div className="box-wrapper-square">
              <p>
                Instructor Description
              </p>
              </div>
          </div>
        </div>
        <div className="flex-1 min-w-0">
        <div className="box-wrapper">
            <h2 className="h2-large text-center">Students</h2>
            <div className="box-wrapper-square">
              <p>
                Student Description
              </p>
            </div>
            <button className="submit-button">Submit An Assignment</button>
            </div>
        </div>
      </div>
    </main>
  )

}

export default Landing