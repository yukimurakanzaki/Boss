// Root page — redirect to task-list
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/task-list');
}