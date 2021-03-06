import React from 'react';
import { Layout } from '../components/Layout/Layout';
import { TrainingCreate } from '../components/Training/TreningCreate';

export const TrainingCreatePage = () => {
	return (
		<Layout
			page={{
				name: 'Добавить тренинг',
				title: 'Добавить тренинг - MyNewLife club',
			}}
			content={<TrainingCreate />}
		/>
	);
};
