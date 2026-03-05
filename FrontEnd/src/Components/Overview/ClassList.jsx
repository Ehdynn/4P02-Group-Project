const ClassList = ({ studentList, onRemoveRequest }) => {
  const students = Array.isArray(studentList) ? studentList : [];

  return (
    <div className="box-wrapper">
      <h1 className="h1-default">Class List</h1>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full border border-slate-300 text-left">
          <thead className="bg-slate-100">
            <tr>
              <th className="border border-slate-300 px-3 py-2">Name</th>
              <th className="border border-slate-300 px-3 py-2">Student ID</th>
              <th className="border border-slate-300 px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td className="border border-slate-300 px-3 py-2" colSpan={3}>
                  No students enrolled.
                </td>
              </tr>
            ) : (
              students.map((student, index) => {
                const name = student?.student_name ?? student?.name ?? "Unknown Student";
                const studentNum = student?.student_number ?? student?.sid ?? "";
                const studentUid = student?.suid ?? "";
                return (
                  <tr key={studentNum || `${name}-${index}`}>
                    <td className="border border-slate-300 px-3 py-2">{name}</td>
                    <td className="border border-slate-300 px-3 py-2">{studentNum}</td>
                    <td className="border border-slate-300 px-3 py-2">
                      <button
                        type="button"
                        onClick={() =>
                          onRemoveRequest?.({
                            studentId: studentUid || studentNum,
                            studentName: name,
                            studentNumber: studentNum,
                          })
                        }
                        className="text-sm bg-red-500 text-white px-2 py-1 rounded"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClassList;
