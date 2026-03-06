import { CardHeader } from 'reactstrap';
import { SearchInput, SearchInputWithOptions } from './SearchInputs';

export default function SearchParams(props) {
  const { setInput, params } = props;
  return (
    <CardHeader className="d-flex align-items-left gap-2">
      <SearchInput setInput={setInput} params={params} name="top_n">
        Number of results:
      </SearchInput>
      <SearchInput setInput={setInput} params={params} name="threshold">
        Similarity threshold:
      </SearchInput>
      <SearchInputWithOptions setInput={setInput} params={params} name="fp_type" options={['morganFP', 'maccsFP']}>
        Fingerprint:
      </SearchInputWithOptions>
      <SearchInputWithOptions setInput={setInput} params={params} name="metric" options={['tanimoto', 'dice']}>
        Metric:
      </SearchInputWithOptions>
    </CardHeader>
  );
}
