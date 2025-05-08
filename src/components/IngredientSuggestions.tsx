'use client';

import { useState, useEffect } from 'react';
import { Combobox } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline';

interface IngredientSuggestionsProps {
  onSelect: (ingredient: string) => void;
}

export default function IngredientSuggestions({ onSelect }: IngredientSuggestionsProps) {
  const [query, setQuery] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchIngredients = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/ingredients');
        if (response.ok) {
          const data = await response.json();
          setIngredients(data);
        }
      } catch (error) {
        console.error('Error fetching ingredients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIngredients();
  }, []);

  const filteredIngredients = query === ''
    ? ingredients
    : ingredients.filter((ingredient) =>
        ingredient.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <Combobox as="div" className="relative" onChange={onSelect}>
      <div className="relative">
        <Combobox.Input
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
          placeholder="Search ingredients..."
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </Combobox.Button>
      </div>

      {filteredIngredients.length > 0 && (
        <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {filteredIngredients.map((ingredient) => (
            <Combobox.Option
              key={ingredient}
              value={ingredient}
              className={({ active }: { active: boolean }) =>
                `relative cursor-default select-none py-2 pl-3 pr-9 ${
                  active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                }`
              }
            >
              {({ active, selected }: { active: boolean; selected: boolean }) => (
                <>
                  <span className={`block truncate ${selected ? 'font-semibold' : ''}`}>
                    {ingredient}
                  </span>
                  {selected && (
                    <span
                      className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
                        active ? 'text-white' : 'text-indigo-600'
                      }`}
                    >
                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  )}
                </>
              )}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      )}
    </Combobox>
  );
} 