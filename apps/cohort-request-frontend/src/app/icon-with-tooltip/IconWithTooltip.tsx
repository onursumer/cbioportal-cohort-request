import styles from './IconWithTooltip.module.scss';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';

export interface IconWithTooltipProps {
  icon: IconDefinition;
  tooltipContent: JSX.Element;
  iconClassName?: string;
  tooltipClassName?: string;
  onClick?: () => void;
}

export function IconWithTooltip(props: IconWithTooltipProps) {
  // Alternative: Use Tooltip instead of Popover
  // const renderTooltip = (props: TooltipProps) => (
  //   <Tooltip
  //     id="studyInfoTooltip"
  //     className={styles.tooltipClassName}
  //     {...props}
  //   >
  //     ...
  //   </Tooltip>
  // );
  const popover = (
    <Popover id="popover-basic" className={props.tooltipClassName}>
      <Popover.Body>{props.tooltipContent}</Popover.Body>
    </Popover>
  );

  return (
    <OverlayTrigger
      placement="top"
      delay={{ show: 250, hide: 1000 }}
      overlay={popover}
    >
      <FontAwesomeIcon
        icon={props.icon}
        className={props.iconClassName}
        onClick={props.onClick}
      />
    </OverlayTrigger>
  );
}

export default IconWithTooltip;
