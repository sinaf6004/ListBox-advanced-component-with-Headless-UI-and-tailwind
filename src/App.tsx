import { Fragment, useMemo, useRef, useState, useEffect } from "react";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
  Transition,
} from "@headlessui/react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/20/solid";
import { useVirtualizer } from "@tanstack/react-virtual";

type Option = {
  id: number;
  label: string;
};

const rawData: Option[] = Array.from({ length: 100000 }, (_, i) => ({
  id: i,
  label: `Item ${i}`,
}));

export default function AdvancedSelect() {
  const [selected, setSelected] = useState<Option[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false); // Track dropdown open state

  const filtered = useMemo(
    () =>
      rawData.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );

  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36,
    overscan: 5,
  });

  useEffect(() => {
    if (open) {
      setTimeout(() => virtualizer.measure(), 0);
    }
  }, [open, virtualizer, filtered]);

  const allSelected = selected.length === filtered.length;
  const toggleSelectAll = () => setSelected(allSelected ? [] : filtered);

  return (
    <div className="w-80">
      <Listbox value={selected} onChange={setSelected} multiple>
        {({ open: isOpen }) => {
          if (open !== isOpen) setOpen(isOpen);

          return (
            <div className="relative">
              <ListboxButton className="w-full rounded border bg-white py-2 pl-3 pr-10 text-left text-gray-900 shadow">
                {selected.length > 0
                  ? `${selected.length} selected`
                  : "Select items"}
                <ChevronUpDownIcon className="absolute right-2 top-2 h-5 w-5 text-gray-500" />
              </ListboxButton>

              <Transition as={Fragment}>
                <ListboxOptions className="absolute mt-1 w-full rounded bg-white shadow border z-50">
                  <div className="p-2">
                    <input
                      type="text"
                      placeholder="Search..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="w-full border rounded px-2 py-1 text-gray-900"
                    />
                  </div>

                  <div className="px-2 pb-2">
                    <button
                      onClick={toggleSelectAll}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {allSelected ? "Select none" : "Select all"}
                    </button>
                  </div>

                  <div ref={parentRef} className="max-h-60 overflow-auto">
                    <div
                      style={{
                        height: virtualizer.getTotalSize(),
                        position: "relative",
                      }}
                    >
                      {virtualizer.getVirtualItems().map((row) => {
                        const item = filtered[row.index];
                        return (
                          <ListboxOption
                            key={item.id}
                            value={item}
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              transform: `translateY(${row.start}px)`,
                            }}
                            className="cursor-pointer select-none py-2 pl-10 pr-4 text-gray-900
                                       data-[focus]:bg-blue-100
                                       data-[selected]:font-medium"
                          >
                            <span className="block truncate">{item.label}</span>

                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 opacity-0 data-[selected]:opacity-100">
                              <CheckIcon className="h-5 w-5 text-blue-600" />
                            </span>
                          </ListboxOption>
                        );
                      })}
                    </div>
                  </div>
                </ListboxOptions>
              </Transition>
            </div>
          );
        }}
      </Listbox>
    </div>
  );
}
