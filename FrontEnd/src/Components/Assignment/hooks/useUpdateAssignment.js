import { useCallback, useState } from "react";
import toTimestamptzIso from "../../../utils/Timestamp/toTimestamptzIso";
import { updateAssignment } from "../../../utils/DatabaseInteractions/Instructor/updateAssignment";

export function useUpdateAssignment(aid, formData, setFormData, setDetails){
    
    const [submitted, setSubmitted] = useState(false);
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [updateError, setUpdateError] = useState("");

    // Handle form input changes
    const onChange = (event) => {
        const { name, value } = event.target;
        setFormData((previous) => ({ ...previous, [name]: value }));
        setUpdateError("");
        setSubmitted(false);
    };

    // Handle form submission
    const handleSubmit = useCallback( 
        // Use useCallback to memoize the function and prevent unnecessary re-renders
        async (event) => {
            event.preventDefault();

            // Reset submission state on new submit
            setSubmitted(false);

            const {dueDate, description } = formData;

            // Validate name field
            if (!formData.name.trim()) { setUpdateError("Name field can not be blank."); return;}
            
            setLoadingUpdate(true);
            setUpdateError("");

            // Convert due date to ISO format with timezone
            const dueDateWithTimezone = toTimestamptzIso(dueDate);

            // Validate due date format if provided
            if (dueDate && !dueDateWithTimezone) {
                setLoadingUpdate(false);
                setUpdateError("Invalid due date format.");
                return;
            }

            let assignmentData = null;

            // Attempt to update the assignment
            try {
                assignmentData = await updateAssignment(aid, formData.name, dueDateWithTimezone, description);
            } catch (invokeError) {
                let errorMessage = invokeError instanceof Error ? invokeError.message : "Unable to create assignment";
                if (invokeError?.context) {
                    try {
                        const payload = await invokeError.context.json();
                        errorMessage = payload?.error || errorMessage;
                    } catch {} // Keep default message if response is not JSON.
                }

                // Update state with error message
                setUpdateError(errorMessage);
                setSubmitted(false);
                setLoadingUpdate(false);
                return;
            }

            setLoadingUpdate(false);
            setSubmitted(true);
            setDetails(assignmentData)
        },[formData]
    );

    return{
        handleSubmit,
        submitted,
        loadingUpdate,
        onChange,
        updateError,
    };
}