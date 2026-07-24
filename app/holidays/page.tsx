import type { Metadata } from 'next';
import ReligiousHolidayExplorer from '../components/ReligiousHolidayExplorer';

export const metadata:Metadata={title:'Religious holidays by country',description:'Compare Christian public holidays and fixed or movable Church calendar dates by country, year and Christian tradition.'};
export default function ReligiousHolidaysPage(){return <ReligiousHolidayExplorer/>}
