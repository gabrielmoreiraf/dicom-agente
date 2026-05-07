import * as Select from "@radix-ui/react-select";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import radixSelect from "@/components/ui/RadixSelect.module.css";
import styles from "./PageSizeSelect.module.css";

export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const;
export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

type Props = {
  value: PageSize;
  onChange: (n: PageSize) => void;
  id?: string;
  "aria-label"?: string;
};

export function PageSizeSelect({
  value,
  onChange,
  id,
  "aria-label": ariaLabel = "Itens por página",
}: Props) {
  return (
    <Select.Root
      value={String(value)}
      onValueChange={(v) => onChange(Number(v) as PageSize)}
    >
      <Select.Trigger
        id={id}
        className={`${radixSelect.trigger} ${styles.trigger}`}
        aria-label={ariaLabel}
      >
        <Select.Value />
        <Select.Icon className={radixSelect.triggerIcon}>
          <KeyboardArrowDown sx={{ fontSize: 20 }} />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          className={radixSelect.content}
          position="popper"
          sideOffset={4}
        >
          <Select.Viewport className={radixSelect.viewport}>
            {PAGE_SIZE_OPTIONS.map((n) => (
              <Select.Item
                key={n}
                value={String(n)}
                className={radixSelect.item}
              >
                <Select.ItemText>{n}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
