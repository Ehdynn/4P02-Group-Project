import { useParams } from "react-router-dom";
import {useState} from 'react';
import ComparisonList from "../../Components/Comparison/ComparisonList";
import ComparisonViewer from "../../Components/Comparison/ComparisonViewer";
import ComparisonStats from "../../Components/Comparison/ComparisonStats";

const Comparison = () => {
  const {aid} = useParams();
  // Comparison list is a set of pairs (suid, fileid) where fileid is the uuid for the comparison file
  const [comparisonList, setComparisonList] = useState([]);
  return (
    <main className="outer-container-fw">
      <h1 className="h1-default text-center">Comparison Placeholder Viewing {aid}</h1>
      <div className="flex w-full space-x-5 flex-col md:flex-row">
        <div className="flex-1 min-w-0">
          <ComparisonList comparisonList={comparisonList} />
        </div>
        <div className="flex-4 min-w-0">
          <ComparisonStats />
          <ComparisonViewer />
        </div>
      </div>
    </main>
  )
}

export default Comparison