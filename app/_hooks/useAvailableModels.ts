import DefaultPromptInput from 'app/_data-models/DefaultPromptInput'
import ImageModels from 'app/_data-models/ImageModels'

export function useAvailableModels({
  input,
  filterNsfw = false,
  sort = 'workers'
}: {
  input: DefaultPromptInput
  filterNsfw?: boolean
  sort?: string
}) {
  const filteredModels = ImageModels.getValidModels({
    input,
    filterNsfw,
    sort
  })

  const modelsOptions = ImageModels.dropdownOptions({ filteredModels })

  // Temporarily seed drop down while waiting for data to load.
  if (modelsOptions.length <= 1) {
    modelsOptions.unshift({
      name: "ICBINP - I Can't Believe It's Not Photography",
      value: "ICBINP - I Can't Believe It's Not Photography",
      label: "ICBINP - I Can't Believe It's Not Photography (17)",
      count: 17
    })
    modelsOptions.unshift({
      name: 'stable_diffusion',
      value: 'stable_diffusion',
      label: 'stable_diffusion (21)',
      count: 21
    })
    modelsOptions.unshift({
      name: 'Anything Diffusion',
      value: 'Anything Diffusion',
      label: 'Anything Diffusion (32)',
      count: 32
    })
    modelsOptions.unshift({
      name: 'Deliberate',
      value: 'Deliberate',
      label: 'Deliberate (43)',
      count: 43
    })
  }

  return [modelsOptions, filteredModels]
}
