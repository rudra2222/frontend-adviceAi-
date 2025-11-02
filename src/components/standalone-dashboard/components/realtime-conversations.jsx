// React default import not required with the new JSX transform
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "../ui/card.jsx";

export function RealtimeConversations() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-body">
                    Real-Time Conversation Counter
                </CardTitle>
                <CardDescription className="font-body">
                    Live updates every 30 seconds
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
                <div>
                    <p className="text-sm text-muted-foreground font-body">
                        Total This Month
                    </p>
                    <p className="text-4xl font-bold font-display">1,234</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground font-body">
                        Active Now
                    </p>
                    <p className="text-4xl font-bold font-display text-primary">
                        56
                    </p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground font-body">
                        AI Handled
                    </p>
                    <p className="text-4xl font-bold font-display">78%</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground font-body">
                        Agent Handled
                    </p>
                    <p className="text-4xl font-bold font-display">22%</p>
                </div>
            </CardContent>
        </Card>
    );
}
