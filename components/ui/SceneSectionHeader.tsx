interface SceneSectionHeaderProps {
  title: string
}

/**
 * SceneSectionHeader - Standard section header for scene editor
 * Consistent padding and typography for all scene sections
 */
export function SceneSectionHeader({ title }: SceneSectionHeaderProps) {
  return (
    <div className="pb-0 pt-[24px]">
      <h2 className="font-['Inter'] text-[16px] font-semibold leading-[24px] text-white">
        {title}
      </h2>
    </div>
  )
}
