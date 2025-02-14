import { Notice, Plugin,  } from 'obsidian';

interface LogEntry {
	CLOCK_IN?: string;
	CLOCK_OUT?: string;
	HOURS?: number;
}

interface FrontMatter {
	LOGBOOK?: LogEntry[];
}

export default class ClockIn extends Plugin {
	async onload() {

		this.addCommand({
			id: 'clock-in',
			name: 'Clock In',
			callback: () => {
				const file = this.app.workspace.getActiveFile();
				if (!file) {
					new Notice('No active file; open a file to clock in')
					return;
				}
				this.app.fileManager.processFrontMatter(file, (frontmatter: FrontMatter) => {
					if (!frontmatter.LOGBOOK) {
						frontmatter.LOGBOOK = [];
					}

					const lastEntry = frontmatter.LOGBOOK[frontmatter.LOGBOOK.length - 1];
					if (lastEntry && lastEntry.CLOCK_IN && !lastEntry.CLOCK_OUT) {
						new Notice('There is already an active clock-in session');
						return;
					}

					const now = new Date();
					const timestamp = now.toISOString();

					frontmatter.LOGBOOK.push({
						CLOCK_IN: timestamp
					});

					new Notice('Clocked in successfully');
				});
			}
		});

		this.addCommand({
			id: 'clock-out',
			name: 'Clock Out',
			callback: () => {
				const file = this.app.workspace.getActiveFile();
				if (!file) {
					new Notice('No active file; open a file with an active clock to clock out');
					return;
				}

				this.app.fileManager.processFrontMatter(file, (frontmatter: FrontMatter) => {
					if (!frontmatter.LOGBOOK || frontmatter.LOGBOOK.length === 0) {
						new Notice('No clock-in session found');
						return;
					}
					const lastEntry = frontmatter.LOGBOOK[frontmatter.LOGBOOK.length - 1];
					if (!lastEntry.CLOCK_IN || lastEntry.CLOCK_OUT) {
						new Notice('No active clock-in session found');
						return;
					}

					const now = new Date();
					const clockOutTimestamp = now.toISOString();
					lastEntry.CLOCK_OUT = clockOutTimestamp;

					const clockInTime = new Date(lastEntry.CLOCK_IN);
					const clockOutTime = new Date(clockOutTimestamp);
					const diffInHours = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);
					lastEntry.HOURS = Math.round(diffInHours * 100) / 100;

					new Notice(`Clocked out successfully. Session duration: ${lastEntry.HOURS} hours`);
				});
			}
		});

		this.addCommand({
			id: 'recalculate-hours',
			name: 'Recalculate Hours',
			callback: () => {
				const file = this.app.workspace.getActiveFile();
				if (!file) {
					new Notice('No active file; open a file with LOGBOOK entries');
					return;
				}

				this.app.fileManager.processFrontMatter(file, (frontmatter: FrontMatter) => {
					if (!frontmatter.LOGBOOK || frontmatter.LOGBOOK.length === 0) {
						new Notice('No LOGBOOK entries found');
						return;
					}

					let updatedEntries = 0;

					frontmatter.LOGBOOK.forEach((entry: LogEntry) => {
						if (entry.CLOCK_IN && entry.CLOCK_OUT) {
							const clockIn = new Date(entry.CLOCK_IN);
							const clockOut = new Date(entry.CLOCK_OUT);

							const diffHours = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);
							const roundedHours = Math.round(diffHours * 100) / 100;

							if (entry.HOURS !== roundedHours) {
								entry.HOURS = roundedHours;
								updatedEntries++;
							}
						}
					});

					new Notice(`Updated ${updatedEntries} time entries`);
				});
			}

		});
	}
}