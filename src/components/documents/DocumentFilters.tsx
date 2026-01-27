import { Search, Calendar, Tag, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { DocumentFilters as FilterType, DocumentSource, DocumentStatus } from '@/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { availableTags } from '@/data/mockData';

interface DocumentFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
}

const sourceLabels: Record<DocumentSource, string> = {
  manual_upload: 'Manual Upload',
  scan_to_email: 'Scan-to-Email',
  gmail: 'Gmail',
  outlook: 'Outlook',
};

const statusLabels: Record<DocumentStatus, string> = {
  parsed: 'Parsed',
  needs_review: 'Needs Review',
  processing: 'Processing',
};

export function DocumentFilters({ filters, onFiltersChange }: DocumentFiltersProps) {
  const hasActiveFilters = filters.search || filters.dateFrom || filters.dateTo || 
    filters.tags.length > 0 || filters.source || filters.status;

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      tags: [],
      dateFrom: undefined,
      dateTo: undefined,
      source: undefined,
      status: undefined,
    });
  };

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    onFiltersChange({ ...filters, tags: newTags });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-9"
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              {filters.dateFrom ? (
                <span>
                  {format(filters.dateFrom, 'MMM d')}
                  {filters.dateTo && ` - ${format(filters.dateTo, 'MMM d')}`}
                </span>
              ) : (
                'Date range'
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="range"
              selected={{ from: filters.dateFrom, to: filters.dateTo }}
              onSelect={(range) => onFiltersChange({
                ...filters,
                dateFrom: range?.from,
                dateTo: range?.to,
              })}
              numberOfMonths={2}
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>

        <Select
          value={filters.source || 'all'}
          onValueChange={(value) => onFiltersChange({
            ...filters,
            source: value === 'all' ? undefined : value as DocumentSource,
          })}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sources</SelectItem>
            {Object.entries(sourceLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status || 'all'}
          onValueChange={(value) => onFiltersChange({
            ...filters,
            status: value === 'all' ? undefined : value as DocumentStatus,
          })}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {Object.entries(statusLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Tag className="h-4 w-4" />
              Tags
              {filters.tags.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {filters.tags.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="start">
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={filters.tags.includes(tag) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
            <X className="h-4 w-4" />
            Clear filters
          </Button>
        )}
      </div>

      {filters.tags.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Active tags:</span>
          <div className="flex flex-wrap gap-1">
            {filters.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => toggleTag(tag)}
                />
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
