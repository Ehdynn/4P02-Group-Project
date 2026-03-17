import { useEffect, useCallback, useState } from "react";
import { updateCourse } from '../../../utils/DatabaseInteractions/Instructor/updateCourse';

export function useUpdateCourse(selectedCourse, courses ,setError){
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({ joinCode: "" });
  const [submitted, setSubmitted] = useState(false);
  
  const selectedCourseObj = courses.find(
    (course) => String(course?.cid) === String(selectedCourse)
  );

  useEffect(() => {
    setFormData({ joinCode: selectedCourseObj?.join_code ?? "" });
    setSubmitted(false);
    setError("");
  },[selectedCourse, courses, selectedCourseObj, setError]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setError("");
    setSubmitted(false);
  };

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    const { joinCode } = formData;

    if (!joinCode.trim()) {
      setError("New join code required.");
      return;
    }

    setUpdating(true);
    setError("");

    let updatedCode = null;
    try {
      updatedCode = await updateCourse(selectedCourse, joinCode);
    } catch (createError) {
      const errorMessage =
        createError instanceof Error ? createError.message : "Unable to update course.";
      setError(errorMessage);
      setSubmitted(false);
      setUpdating(false);
      return;
    }

    setUpdating(false);
    setSubmitted(true);
    setFormData({
      joinCode: updatedCode?.join_code,
    });
    }, [selectedCourse, formData, setError, updateCourse]
  )

  return {
    updating,
    formData,
    submitted,
    handleSubmit,
    onChange
  };
}