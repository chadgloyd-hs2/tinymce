import { NativeSimulatedEvent } from '../../events/SimulatedEvent';
import { DataTransfer, File } from '@ephox/dom-globals';
import { DroppingConfig } from './Dropping';
import * as DataTransfers from './DataTransfers';

export interface DropEvent extends NativeSimulatedEvent {
  data: string;
  files: File[];
}

export const createDropEventDetails = (config: DroppingConfig, event: NativeSimulatedEvent): DropEvent => {
  const rawEvent: any = event.event().raw();
  const transfer: DataTransfer = rawEvent.dataTransfer;
  const data = DataTransfers.getData(transfer, config.type);
  const files = DataTransfers.getFiles(transfer);

  return {
    ...event,
    data,
    files
  };
};
