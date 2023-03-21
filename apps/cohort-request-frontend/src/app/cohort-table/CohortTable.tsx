import styles from './CohortTable.module.scss';
import IconWithTooltip from '../icon-with-tooltip/IconWithTooltip';
import { faPen, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import React from 'react';

export interface CohortTableProps {
  cohortItems: CohortItem[];
  onEdit: (studyId: string) => void;
  onRemove: (studyId: string) => void;
}

export interface CohortItem {
  studyId: string;
  caseIds: string[];
}

interface CohortTableRowProps {
  studyId: string;
  caseIds: string[];
  onEdit: (studyId: string) => void;
  onRemove: (studyId: string) => void;
}

function CohortTable(props: CohortTableProps) {
  return (
    <table className={styles.cohortTable}>
      <tbody>
        {props.cohortItems.map((c) => (
          <CohortTableRow
            key={c.studyId}
            studyId={c.studyId}
            caseIds={c.caseIds}
            onEdit={props.onEdit}
            onRemove={props.onRemove}
          />
        ))}
      </tbody>
    </table>
  );
}

function CohortTableRow(props: CohortTableRowProps) {
  return (
    <tr>
      <td>{props.studyId}</td>
      <td>{props.caseIds.length} sample(s)/patient(s)</td>
      <td>
        <IconWithTooltip
          icon={faPen}
          iconClassName={styles.icon}
          tooltipContent={<>Edit</>}
          onClick={() => props.onEdit(props.studyId)}
        />
      </td>
      <td>
        <IconWithTooltip
          icon={faTrashCan}
          iconClassName={styles.icon}
          tooltipContent={<>Remove</>}
          onClick={() => props.onRemove(props.studyId)}
        />
      </td>
    </tr>
  );
}

export default CohortTable;
