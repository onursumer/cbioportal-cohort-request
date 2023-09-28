import styles from './FileInputPanel.module.scss';
import React, { ChangeEvent, Dispatch, SetStateAction } from 'react';
import { Form } from 'react-bootstrap';
import IconWithTooltip from '../icon-with-tooltip/IconWithTooltip';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

export interface FileInputPanelProps {
  setFileList: Dispatch<SetStateAction<FileList | undefined>>;
}

export async function getDataFromFiles(fileList?: FileList) {
  if (fileList && fileList.length > 0) {
    return await Promise.all(
      Array.from(fileList).map(async (f) => ({
        content: await f.text(),
        filename: f.name,
      }))
    );
  } else {
    return [];
  }
}

function FileUploadInfo() {
  const tooltip = (
    <>You can upload additional data files up to 100 MB in total.</>
  );

  return (
    <IconWithTooltip
      icon={faInfoCircle}
      tooltipContent={tooltip}
      tooltipClassName={styles.studyInfoPopover}
    />
  );
}

export function FileInputPanel(props: FileInputPanelProps) {
  return (
    <Form.Group controlId="additionalDataFiles" className="mb-3">
      <Form.Label>
        Upload Additional Data Files <FileUploadInfo />
      </Form.Label>
      <Form.Control
        type="file"
        multiple={true}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          props.setFileList(e.currentTarget.files || undefined);
        }}
      />
    </Form.Group>
  );
}

export default FileInputPanel;
