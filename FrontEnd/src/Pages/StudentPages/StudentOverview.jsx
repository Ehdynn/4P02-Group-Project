import { useState, useEffect} from "react";
import supabase from "../../utils/DatabaseInteractions/supabase";
import Uploader from "../../Components/Uploader/Uploader";

const StudentOverview = () => {
  return (
    <div>
        <p>StudentOverview</p>
        <p>Temporary Uploader Spot</p>
        <Uploader></Uploader>
    </div>
  )
}

export default StudentOverview